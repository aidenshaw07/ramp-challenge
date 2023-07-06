import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, loading: employeesLoading, fetchAll: fetchAllEmployees } = useEmployees()
  const {
    data: paginatedTransactions,
    loading: transactionsLoading,
    fetchAll: fetchAllTransactions,
  } = usePaginatedTransactions()
  const { data: transactionsByEmployee, fetchById: fetchTransactionsByEmployee } =
    useTransactionsByEmployee()
  const [selectedFilter, setSelectedFilter] = useState<string | "All">("All")

  const loadAllTransactions = useCallback(async () => {
    await fetchAllEmployees()
    await fetchAllTransactions()
  }, [fetchAllEmployees, fetchAllTransactions])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      await fetchTransactionsByEmployee(employeeId)
    },
    [fetchTransactionsByEmployee]
  )

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions()
    }
  }, [employees, employeesLoading, loadAllTransactions])

  const hasMoreData = paginatedTransactions?.nextPage !== null

  const transactions = useMemo(() => {
    if (selectedFilter === "All") {
      return paginatedTransactions?.data ?? null
    } else {
      return transactionsByEmployee ?? null
    }
  }, [selectedFilter, paginatedTransactions?.data, transactionsByEmployee])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
              setSelectedFilter("All")
              return
            }
            setSelectedFilter(newValue.id)
            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && selectedFilter === "All" && (
            <button
              className="RampButton"
              disabled={transactionsLoading || !hasMoreData}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
